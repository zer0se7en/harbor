// Copyright Project Harbor Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package security

import (
	"net/http"
	"strings"

	"github.com/goharbor/harbor/src/common"
	"github.com/goharbor/harbor/src/common/security"
	robotCtx "github.com/goharbor/harbor/src/common/security/robot"
	ctl_robot "github.com/goharbor/harbor/src/controller/robot"
	"github.com/goharbor/harbor/src/lib/log"
	pkg_token "github.com/goharbor/harbor/src/pkg/token"
	robot_claim "github.com/goharbor/harbor/src/pkg/token/claims/robot"
)

type robot struct{}

func (r *robot) Generate(req *http.Request) security.Context {
	log := log.G(req.Context())
	robotName, robotTk, ok := req.BasicAuth()
	if !ok {
		return nil
	}
	if !strings.HasPrefix(robotName, common.RobotPrefix) {
		return nil
	}
	rClaims := &robot_claim.Claim{}
	defaultOpt := pkg_token.DefaultTokenOptions()
	if defaultOpt == nil {
		log.Error("failed to get default token options")
		return nil
	}
	rtk, err := pkg_token.Parse(defaultOpt, robotTk, rClaims)
	if err != nil {
		log.Errorf("failed to decrypt robot token: %v", err)
		return nil
	}
	// Do authn for robot account, as Harbor only stores the token ID, just validate the ID and disable.
	ctr := ctl_robot.Ctl
	robot, err := ctr.Get(req.Context(), rtk.Claims.(*robot_claim.Claim).TokenID, nil)
	if err != nil {
		log.Errorf("failed to get robot %s: %v", robotName, err)
		return nil
	}
	if robot == nil {
		log.Error("the token provided doesn't exist.")
		return nil
	}
	if robotName != robot.Name {
		log.Errorf("failed to authenticate : %v", robotName)
		return nil
	}
	if robot.Disabled {
		log.Errorf("the robot account %s is disabled", robot.Name)
		return nil
	}
	log.Debugf("a robot security context generated for request %s %s", req.Method, req.URL.Path)

	return robotCtx.NewSecurityContext(&robot.Robot, false, rtk.Claims.(*robot_claim.Claim).Access)
}
