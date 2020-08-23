import ChangedThreadService from '../../lib/changed-thread/changed-thread.service';
import { GeneralizedLabel, starredLabel } from '../../lib/models/generalized-label';
import SettingsService from '../../lib/settings/settings.service';
import configMock from '../mocks/config';

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
    const settingsService = new SettingsService(configMock);
    settingsService.emailLabel = starredLabel;
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
    const settingsService = new SettingsService(configMock);
    settingsService.emailLabel = starredLabel;
    const changedThreadService = new ChangedThreadService(queueTask, settingsService, databaseStore, null);
    changedThreadService.listen(subscriber);
    queueTask.fire();
    expect(subscriber).toHaveBeenCalledWith(thread, false);
  });

  it('does not call subscribers when thread is unstarred and current label is different', function() {
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
      }
    };
    const changedThreadService = new ChangedThreadService(
        databaseStore, { emailLabel: new GeneralizedLabel('label') });
    changedThreadService.listen(subscriber);
    databaseStore.fire();
    expect(subscriber).not.toHaveBeenCalled();
  });
});