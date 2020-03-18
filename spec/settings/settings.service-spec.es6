import SettingsService from '../../lib/settings/settings.service';
import Reflux from 'reflux';

describe('SettingsService', function() {
  afterEach(function() {
    new SettingsService().destroy();
  });

  it('is a singleton', function() {
    expect(Reflux.initStore(SettingsService)).toBe(Reflux.initStore(SettingsService));
  });

  it('observes the provided configuration object', function() {
    const observe = jasmine.createSpy('observe').and.returnValue({ dispose() { } });
    Reflux.initStore(class extends SettingsService {
      constructor() {
        super({ observe });
      }
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