import SettingsService from '../../lib/settings/settings.service';

describe('SettingsService', function() {
  afterEach(function() {
    console.log('destroy');
    SettingsService.destroy();
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

  describe('calls a subscriber when the package configuration is changed', function () {
    const subscriber = jasmine.createSpy('subscriber');
    const config = {
      observe(keypath, subscriber) {
        this._subscriber = subscriber;
        return { dispose() { } };
      },
      fire(obj) {
        this._subscriber(obj);
      },
      set() { }
    };
    const settingsService = new SettingsService(config);
    let dispose;

    afterEach(function () {
      expect(subscriber).toHaveBeenCalled();
      subscriber.calls.reset();
      dispose();
    });

    it('(file path of todo.txt)', function() {
      dispose = settingsService.listen(subscriber);
      config.fire({ todoFilePath: 'a/path', emailLabel: 'label', useStarsForLabel: false });
    });

    it('email label', function () {
      dispose = settingsService.listen(subscriber, 'emailLabel');
      config.fire({ todoFilePath: 'a/path', emailLabel: 'label', useStarsForLabel: true });
    });
  })
});