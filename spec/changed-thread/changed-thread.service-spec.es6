import ChangedThreadService from '../../lib/changed-thread/changed-thread.service';
import { GeneralizedLabel, starredLabel } from '../../lib/models/generalized-label';

describe('ChangedThreadService', function() {
  afterEach(function() {
    new ChangedThreadService().destroy();
  });

  it('is a singleton', function() {
    const queueTask = {
      listen() {
        return () => null;
      }
    };
    expect(new ChangedThreadService(queueTask))
      .toBe(new ChangedThreadService());
  });

  it('listens to the provided queueTask action', function() {
    const listen = jasmine.createSpy('listen').and.returnValue(() =>
      null);
    new ChangedThreadService({
      listen
    });
    expect(listen).toHaveBeenCalled();
  });

  it('calls a subscriber when an email is starred', function() {
    const subscriber = jasmine.createSpy('subscriber');
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
    const queueTask = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber({starred: true, threadIds: ['thread-id']});
      }
    };
    const settingsService = {emailLabel: starredLabel};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(subscriber);
    queueTask.fire();
    expect(subscriber).toHaveBeenCalledWith(thread, true);
  });

  it('calls a subscriber when an email is unstarred', function() {
    const subscriber = jasmine.createSpy('subscriber');
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
    const queueTask = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber({starred: false, threadIds: ['thread-id']});
      }
    }
    const settingsService = {emailLabel: starredLabel};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(subscriber);
    queueTask.fire();
    expect(subscriber).toHaveBeenCalledWith(thread, false);
  });

  it('does not call subscribers when thread is unstarred and current label is different', function() {
    const subscriber = jasmine.createSpy('subscriber');
    const queueTask = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber({ starred: false });
      }
    };
    const changedThreadService = new ChangedThreadService(
      queueTask, { emailLabel: new GeneralizedLabel('label') }, null, null);
    changedThreadService.listen(subscriber);
    queueTask.fire();
    expect(subscriber).not.toHaveBeenCalled();
  });

  it('calls a subscriber when an email is moved to a different folder', function() {
    const subscriber = jasmine.createSpy('subscriber');
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
    const queueTask = {
      listen(subscriber, thisArg) {
        this._subscriber = subscriber.bind(thisArg);
        return () => null;
      },
      fire() {
        this._subscriber({folder: {displayName: 'folder'}, threadIds: ['thread-id']});
      }
    };
    const settingsService = {emailLabel: new GeneralizedLabel('folder')};
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(subscriber);
    queueTask.fire();
    expect(subscriber).toHaveBeenCalledWith(thread, true);
  });
});
