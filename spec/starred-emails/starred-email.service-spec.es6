import StarredEmailService from '../../lib/starred-emails/starred-email.service';

describe('StarredEmailService', function() {
  afterEach(function() {
    new StarredEmailService().destroy();
  });

  it('is a singleton', function() {
    expect(new StarredEmailService({
      listen() {
        return () => null;
      }
    })).toBe(new StarredEmailService({
      listen() {
        return () => null;
      }
    }));
  });

  it('listens to the provided database store', function() {
    const listen = jasmine.createSpy('listen').and.returnValue(() =>
      null);
    new StarredEmailService({
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
    const starredEmailService = new StarredEmailService(databaseStore);
    starredEmailService.listen(subscriber);
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
    const starredEmailService = new StarredEmailService(databaseStore);
    starredEmailService.listen(subscriber);
    databaseStore.fire();
    expect(subscriber).toHaveBeenCalledWith(thread);
  });
});