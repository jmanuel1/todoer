import ChangedThreadService from '../../lib/changed-thread/changed-thread.service';
import { GeneralizedLabel, starredLabel } from '../../lib/models/generalized-label';

describe('ChangedThreadService', function() {
  beforeAll(function() {
    this.mockQueueTask = function(taskProperties) {
      let _subscriber;
      const mock = {
        listen(subscriber, thisArg) {
          _subscriber = subscriber.bind(thisArg);
          return () => null;
        },
        fire() {
          _subscriber({...taskProperties, threadIds: ['thread-id']});
        }
      };
      spyOn(mock, 'listen').and.callThrough();
      return mock;
    };
  });

  beforeEach(function() {
    this.subscriber = jasmine.createSpy('subscriber');
  });

  afterEach(function() {
    new ChangedThreadService().destroy();
  });

  it('is a singleton', function() {
    const queueTask = this.mockQueueTask({});
    expect(new ChangedThreadService(queueTask))
      .toBe(new ChangedThreadService());
  });

  it('listens to the provided queueTask action', function() {
    const queueTask = this.mockQueueTask({});
    new ChangedThreadService(queueTask);
    expect(queueTask.listen).toHaveBeenCalled();
  });

  it('calls a subscriber when an email is starred', function() {
    const thread = {
      starred: true
    };
    const payload = {
      objectClass: 'Thread',
      objects: [thread]
    };
    const databaseStore = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber(payload);
      },
      find() {
        return {
          then(callback) {
            callback(thread);
          }
        }
      }
    };
    const queueTask = this.mockQueueTask({starred: true});
    const settingsService = {emailLabel: starredLabel};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(this.subscriber);
    queueTask.fire();
    expect(this.subscriber).toHaveBeenCalledWith(thread, true);
  });

  it('calls a subscriber when an email is unstarred', function() {
    const thread = {
      starred: false
    };
    const payload = {
      objectClass: 'Thread',
      objects: [thread]
    };
    const databaseStore = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber(payload);
      },
      find() {
        return {
          then(callback) {
            callback(thread);
          }
        }
      }
    };
    const queueTask = this.mockQueueTask({starred: false});
    const settingsService = {emailLabel: starredLabel};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(this.subscriber);
    queueTask.fire();
    expect(this.subscriber).toHaveBeenCalledWith(thread, false);
  });

  it('does not call subscribers when thread is unstarred and current label is different', function() {
    const queueTask = this.mockQueueTask({starred: false});
    const changedThreadService = new ChangedThreadService(
      queueTask, { emailLabel: new GeneralizedLabel('label') }, null, null);
    changedThreadService.listen(this.subscriber);
    queueTask.fire();
    expect(this.subscriber).not.toHaveBeenCalled();
  });

  it('calls a subscriber when an email is moved to a different folder', function() {
    const thread = {};
    const payload = {
      objectClass: 'Thread',
      objects: [thread]
    };
    const databaseStore = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber(payload);
      },
      find() {
        return {
          then(callback) {
            callback(thread);
          }
        }
      }
    };
    const queueTask = this.mockQueueTask({folder: {displayName: 'folder'}});
    const settingsService = {emailLabel: new GeneralizedLabel('folder')};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(this.subscriber);
    queueTask.fire();
    expect(this.subscriber).toHaveBeenCalledWith(thread, true);
  });
});
