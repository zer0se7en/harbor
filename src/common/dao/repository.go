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

package dao

import (
	"fmt"
	"time"

	"github.com/astaxie/beego/orm"
	"github.com/goharbor/harbor/src/common/models"
)

var orderMap = map[string]string{
	"name":           "name asc",
	"+name":          "name asc",
	"-name":          "name desc",
	"creation_time":  "creation_time asc",
	"+creation_time": "creation_time asc",
	"-creation_time": "creation_time desc",
	"update_time":    "update_time asc",
	"+update_time":   "update_time asc",
	"-update_time":   "update_time desc",
	"pull_count":     "pull_count asc",
	"+pull_count":    "pull_count asc",
	"-pull_count":    "pull_count desc",
}

// AddRepository adds a repo to the database.
func AddRepository(repo models.RepoRecord) error {
	if repo.ProjectID == 0 {
		return fmt.Errorf("invalid project ID: %d", repo.ProjectID)
	}

	o := GetOrmer()
	now := time.Now()
	repo.CreationTime = now
	repo.UpdateTime = now
	_, err := o.Insert(&repo)
	return err
}

// GetRepositoryByName ...
func GetRepositoryByName(name string) (*models.RepoRecord, error) {
	o := GetOrmer()
	r := models.RepoRecord{Name: name}
	err := o.Read(&r, "Name")
	if err == orm.ErrNoRows {
		return nil, nil
	}
	return &r, err
}

// DeleteRepository ...
func DeleteRepository(name string) error {
	o := GetOrmer()
	_, err := o.QueryTable("repository").Filter("name", name).Delete()
	return err
}

// RepositoryExists returns whether the repository exists according to its name.
func RepositoryExists(name string) bool {
	o := GetOrmer()
	return o.QueryTable("repository").Filter("name", name).Exist()
}

// GetTotalOfRepositories ...
func GetTotalOfRepositories(query ...*models.RepositoryQuery) (int64, error) {
	sql, params := repositoryQueryConditions(query...)
	sql = `select count(*) ` + sql
	var total int64
	if err := GetOrmer().Raw(sql, params).QueryRow(&total); err != nil {
		return 0, err
	}
	return total, nil
}

func repositoryQueryConditions(query ...*models.RepositoryQuery) (string, []interface{}) {
	params := []interface{}{}
	sql := `from repository r `
	if len(query) == 0 || query[0] == nil {
		return sql, params
	}
	q := query[0]

	if q.LabelID > 0 {
		sql += `join harbor_resource_label rl on r.repository_id = rl.resource_id
		and rl.resource_type = 'r' `
	}
	sql += `where 1=1 `

	if len(q.Name) > 0 {
		sql += `and r.name like ? `
		params = append(params, "%"+Escape(q.Name)+"%")
	}

	if len(q.ProjectIDs) > 0 {
		sql += fmt.Sprintf(`and r.project_id in ( %s ) `,
			ParamPlaceholderForIn(len(q.ProjectIDs)))
		params = append(params, q.ProjectIDs)
	}

	if len(q.ProjectName) > 0 {
		sql += `and r.name like ? `
		params = append(params, q.ProjectName+"/%")
	}

	if q.LabelID > 0 {
		sql += `and rl.label_id = ? `
		params = append(params, q.LabelID)
	}

	return sql, params
}
