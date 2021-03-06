// Code generated by mockery v2.1.0. DO NOT EDIT.

package scanner

import (
	context "context"

	daoscanner "github.com/goharbor/harbor/src/pkg/scan/dao/scanner"
	mock "github.com/stretchr/testify/mock"

	q "github.com/goharbor/harbor/src/lib/q"
)

// Manager is an autogenerated mock type for the Manager type
type Manager struct {
	mock.Mock
}

// Count provides a mock function with given fields: ctx, query
func (_m *Manager) Count(ctx context.Context, query *q.Query) (int64, error) {
	ret := _m.Called(ctx, query)

	var r0 int64
	if rf, ok := ret.Get(0).(func(context.Context, *q.Query) int64); ok {
		r0 = rf(ctx, query)
	} else {
		r0 = ret.Get(0).(int64)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *q.Query) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Create provides a mock function with given fields: ctx, registration
func (_m *Manager) Create(ctx context.Context, registration *daoscanner.Registration) (string, error) {
	ret := _m.Called(ctx, registration)

	var r0 string
	if rf, ok := ret.Get(0).(func(context.Context, *daoscanner.Registration) string); ok {
		r0 = rf(ctx, registration)
	} else {
		r0 = ret.Get(0).(string)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *daoscanner.Registration) error); ok {
		r1 = rf(ctx, registration)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// Delete provides a mock function with given fields: ctx, registrationUUID
func (_m *Manager) Delete(ctx context.Context, registrationUUID string) error {
	ret := _m.Called(ctx, registrationUUID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string) error); ok {
		r0 = rf(ctx, registrationUUID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Get provides a mock function with given fields: ctx, registrationUUID
func (_m *Manager) Get(ctx context.Context, registrationUUID string) (*daoscanner.Registration, error) {
	ret := _m.Called(ctx, registrationUUID)

	var r0 *daoscanner.Registration
	if rf, ok := ret.Get(0).(func(context.Context, string) *daoscanner.Registration); ok {
		r0 = rf(ctx, registrationUUID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*daoscanner.Registration)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, registrationUUID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetDefault provides a mock function with given fields: ctx
func (_m *Manager) GetDefault(ctx context.Context) (*daoscanner.Registration, error) {
	ret := _m.Called(ctx)

	var r0 *daoscanner.Registration
	if rf, ok := ret.Get(0).(func(context.Context) *daoscanner.Registration); ok {
		r0 = rf(ctx)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*daoscanner.Registration)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context) error); ok {
		r1 = rf(ctx)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// List provides a mock function with given fields: ctx, query
func (_m *Manager) List(ctx context.Context, query *q.Query) ([]*daoscanner.Registration, error) {
	ret := _m.Called(ctx, query)

	var r0 []*daoscanner.Registration
	if rf, ok := ret.Get(0).(func(context.Context, *q.Query) []*daoscanner.Registration); ok {
		r0 = rf(ctx, query)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*daoscanner.Registration)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, *q.Query) error); ok {
		r1 = rf(ctx, query)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SetAsDefault provides a mock function with given fields: ctx, registrationUUID
func (_m *Manager) SetAsDefault(ctx context.Context, registrationUUID string) error {
	ret := _m.Called(ctx, registrationUUID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string) error); ok {
		r0 = rf(ctx, registrationUUID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Update provides a mock function with given fields: ctx, registration
func (_m *Manager) Update(ctx context.Context, registration *daoscanner.Registration) error {
	ret := _m.Called(ctx, registration)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *daoscanner.Registration) error); ok {
		r0 = rf(ctx, registration)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}
