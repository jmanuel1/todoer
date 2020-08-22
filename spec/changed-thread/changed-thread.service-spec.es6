import ChangedThreadService from '../../lib/changed-thread/changed-thread.service';
import { GeneralizedLabel } from '../../lib/models/generalized-label';

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
      }
    };
    const changedThreadService = new ChangedThreadService(databaseStore);
    changedThreadService.listen(subscriber);
    databaseStore.fire();
    expect(subscriber).toHaveBeenCalledWith(thread);
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
      }
    };
    const changedThreadService = new ChangedThreadService(databaseStore);
    changedThreadService.listen(subscriber);
    databaseStore.fire();
    expect(subscriber).toHaveBeenCalledWith(thread);
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