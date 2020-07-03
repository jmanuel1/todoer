export default class ChangedThreadService {
  constructor(databaseStore) {
    if (this.constructor._instance !== undefined) {
      return this.constructor._instance;
    }
    this.constructor._instance = this;
    this._databaseStore = databaseStore;
    this._subscribers = [];
    this._unlistenToDatabaseStore = databaseStore.listen(this._onDataChanged,
      this);
  }

  _onDataChanged(payload) {
    if (payload.objectClass !== 'Thread') {
      return;
    }
    // We catch all changes to threads, whether that means stars or labels
    for (const thread of payload.objects) {
      for (const subscriber of this._subscribers) {
        subscriber(thread);
      }
    }
  }

  listen(subscriber) {
    this._subscribers = (this._subscribers || []).concat([subscriber]);
  }

  destroy() {
    this.constructor._instance = undefined;
    this._unlistenToDatabaseStore();
  }
}