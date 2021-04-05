package handler

import (
	"context"

	"github.com/goharbor/harbor/src/controller/event"
	"github.com/goharbor/harbor/src/controller/event/handler/auditlog"
	"github.com/goharbor/harbor/src/controller/event/handler/internal"
	"github.com/goharbor/harbor/src/controller/event/handler/p2p"
	"github.com/goharbor/harbor/src/controller/event/handler/replication"
	"github.com/goharbor/harbor/src/controller/event/handler/webhook/artifact"
	"github.com/goharbor/harbor/src/controller/event/handler/webhook/chart"
	"github.com/goharbor/harbor/src/controller/event/handler/webhook/quota"
	"github.com/goharbor/harbor/src/controller/event/handler/webhook/scan"
	"github.com/goharbor/harbor/src/controller/event/metadata"
	"github.com/goharbor/harbor/src/jobservice/job"
	"github.com/goharbor/harbor/src/pkg/notification"
	"github.com/goharbor/harbor/src/pkg/notifier"
	"github.com/goharbor/harbor/src/pkg/task"
)

func init() {
	// notification
	notifier.Subscribe(event.TopicPushArtifact, &artifact.Handler{})
	notifier.Subscribe(event.TopicPullArtifact, &artifact.Handler{})
	notifier.Subscribe(event.TopicDeleteArtifact, &artifact.Handler{})
	notifier.Subscribe(event.TopicUploadChart, &chart.Handler{})
	notifier.Subscribe(event.TopicDeleteChart, &chart.Handler{})
	notifier.Subscribe(event.TopicDownloadChart, &chart.Handler{})
	notifier.Subscribe(event.TopicQuotaExceed, &quota.Handler{})
	notifier.Subscribe(event.TopicQuotaWarning, &quota.Handler{})
	notifier.Subscribe(event.TopicScanningFailed, &scan.Handler{})
	notifier.Subscribe(event.TopicScanningCompleted, &scan.Handler{})
	notifier.Subscribe(event.TopicDeleteArtifact, &scan.DelArtHandler{})
	notifier.Subscribe(event.TopicReplication, &artifact.ReplicationHandler{})
	notifier.Subscribe(event.TopicTagRetention, &artifact.RetentionHandler{})

	// replication
	notifier.Subscribe(event.TopicPushArtifact, &replication.Handler{})
	notifier.Subscribe(event.TopicDeleteArtifact, &replication.Handler{})
	notifier.Subscribe(event.TopicCreateTag, &replication.Handler{})
	notifier.Subscribe(event.TopicDeleteTag, &replication.Handler{})

	// p2p preheat
	notifier.Subscribe(event.TopicPushArtifact, &p2p.Handler{})
	notifier.Subscribe(event.TopicScanningCompleted, &p2p.Handler{})
	notifier.Subscribe(event.TopicArtifactLabeled, &p2p.Handler{})

	// audit logs
	notifier.Subscribe(event.TopicPushArtifact, &auditlog.Handler{})
	notifier.Subscribe(event.TopicPullArtifact, &auditlog.Handler{})
	notifier.Subscribe(event.TopicDeleteArtifact, &auditlog.Handler{})
	notifier.Subscribe(event.TopicCreateProject, &auditlog.Handler{})
	notifier.Subscribe(event.TopicDeleteProject, &auditlog.Handler{})
	notifier.Subscribe(event.TopicDeleteRepository, &auditlog.Handler{})
	notifier.Subscribe(event.TopicCreateTag, &auditlog.Handler{})
	notifier.Subscribe(event.TopicDeleteTag, &auditlog.Handler{})

	// internal
	notifier.Subscribe(event.TopicPullArtifact, &internal.Handler{})
	notifier.Subscribe(event.TopicPushArtifact, &internal.Handler{})

	task.RegisterTaskStatusChangePostFunc(job.Replication, func(ctx context.Context, taskID int64, status string) error {
		notification.AddEvent(ctx, &metadata.ReplicationMetaData{
			ReplicationTaskID: taskID,
			Status:            status,
		})
		return nil
	})
}
