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

package orm

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/astaxie/beego/orm"
	"github.com/goharbor/harbor/src/lib/log"
)

// NewCondition alias function of orm.NewCondition
var NewCondition = orm.NewCondition

// Condition alias to orm.Condition
type Condition = orm.Condition

// Params alias to orm.Params
type Params = orm.Params

// ParamsList alias to orm.ParamsList
type ParamsList = orm.ParamsList

// QuerySeter alias to orm.QuerySeter
type QuerySeter = orm.QuerySeter

// RegisterModel ...
func RegisterModel(models ...interface{}) {
	orm.RegisterModel(models...)
}

type ormKey struct{}

func init() {
	if os.Getenv("ORM_DEBUG") == "true" {
		orm.Debug = true
	}
}

// FromContext returns orm from context
func FromContext(ctx context.Context) (orm.Ormer, error) {
	o, ok := ctx.Value(ormKey{}).(orm.Ormer)
	if !ok {
		return nil, errors.New("cannot get the ORM from context")
	}
	return o, nil
}

// NewContext returns new context with orm
func NewContext(ctx context.Context, o orm.Ormer) context.Context {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithValue(ctx, ormKey{}, o)
}

// Context returns a context with an orm
func Context() context.Context {
	return NewContext(context.Background(), orm.NewOrm())
}

// Clone returns new context with orm for ctx
func Clone(ctx context.Context) context.Context {
	return NewContext(ctx, orm.NewOrm())
}

// WithTransaction a decorator which make f run in transaction
func WithTransaction(f func(ctx context.Context) error) func(ctx context.Context) error {
	return func(ctx context.Context) error {
		o, err := FromContext(ctx)
		if err != nil {
			return err
		}

		tx := ormerTx{Ormer: o}
		if err := tx.Begin(); err != nil {
			log.Errorf("begin transaction failed: %v", err)
			return err
		}

		if err := f(ctx); err != nil {
			if e := tx.Rollback(); e != nil {
				log.Errorf("rollback transaction failed: %v", e)
				return e
			}

			return err
		}

		if err := tx.Commit(); err != nil {
			log.Errorf("commit transaction failed: %v", err)
			return err
		}

		return nil
	}
}

// ReadOrCreate read or create instance to datebase, retry to read when met a duplicate key error after the creating
func ReadOrCreate(ctx context.Context, md interface{}, col1 string, cols ...string) (created bool, id int64, err error) {
	getter, ok := md.(interface {
		GetID() int64
	})

	if !ok {
		err = fmt.Errorf("missing GetID method for the model %T", md)
		return
	}

	defer func() {
		if !created && err == nil { // found in the database
			id = getter.GetID()
		}
	}()

	o, err := FromContext(ctx)
	if err != nil {
		return
	}

	cols = append([]string{col1}, cols...)

	err = o.Read(md, cols...)
	if err == nil { // found in the database
		return
	}

	if !errors.Is(err, orm.ErrNoRows) { // met a error when read database
		return
	}

	// not found in the database, try to create one
	err = WithTransaction(func(ctx context.Context) error {
		o, err := FromContext(ctx)
		if err != nil {
			return err
		}

		id, err = o.Insert(md)
		return err
	})(ctx)

	if err == nil { // create success
		created = true

		return
	}

	// got a duplicate key error, try to read again
	if IsDuplicateKeyError(err) {
		err = o.Read(md, cols...)
	}

	return
}

// CreateInClause creates an IN clause with the provided sql and args to avoid the sql injection
// The sql should return the ID list with the specific condition(e.g. select id from table1 where column1=?)
// The sql runs as a prepare statement with the "?" be populated rather than concat string directly
// The returning in clause is a string like "IN (id1, id2, id3, ...)"
func CreateInClause(ctx context.Context, sql string, args ...interface{}) (string, error) {
	ormer, err := FromContext(ctx)
	if err != nil {
		return "", err
	}
	ids := []int64{}
	if _, err = ormer.Raw(sql, args...).QueryRows(&ids); err != nil {
		return "", err
	}
	// no matching, append -1 as the id
	if len(ids) == 0 {
		ids = append(ids, -1)
	}
	var idStrs []string
	for _, id := range ids {
		idStrs = append(idStrs, strconv.FormatInt(id, 10))
	}
	// there is no too many arguments issue like https://github.com/goharbor/harbor/issues/12269
	// when concat the in clause directly
	return fmt.Sprintf(`IN (%s)`, strings.Join(idStrs, ",")), nil
}

// Escape ..
func Escape(str string) string {
	str = strings.Replace(str, `\`, `\\`, -1)
	str = strings.Replace(str, `%`, `\%`, -1)
	str = strings.Replace(str, `_`, `\_`, -1)
	return str
}

// ParamPlaceholderForIn returns a string that contains placeholders for sql keyword "in"
// e.g. n=3, returns "?,?,?"
func ParamPlaceholderForIn(n int) string {
	placeholders := []string{}
	for i := 0; i < n; i++ {
		placeholders = append(placeholders, "?")
	}
	return strings.Join(placeholders, ",")
}
