import SettingsService from '../../lib/settings/settings.service';

describe('SettingsService', function() {
  afterEach(function() {
    new SettingsService().destroy();
  });

  it('is a singleton', function() {
    expect(new SettingsService({
      observe() {
        return { dispose() { } };
      }
    })).toBe(new SettingsService({
      observe() {
        return { dispose() { } };
      }
    }));
  });

  it('observes the provided configuration object', function() {
    const observe = jasmine.createSpy('observe').and.returnValue({ dispose() { } });
    new SettingsService({
      observe
    });
    expect(observe).toHaveBeenCalled();
  });

  it('calls a subscriber when the todoer configuration changes', function() {
    const subscriber = jasmine.createSpy('subscriber');
    const config = {
      observe(keypath, subscriber) {
        this._subscriber = subscriber;
        return { dispose() { } };
      },
      fire() {
        this._subscriber();
      }
    };
    const settingsService = new SettingsService(config);
    settingsService.listen(subscriber);
    config.fire();
    expect(subscriber).toHaveBeenCalled();
  });
});