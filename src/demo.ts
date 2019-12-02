import JSBridgeBase from './main';

class JSBridgeDemo extends JSBridgeBase {
  constructor() {
    super();
  }

  public demoAPI() {
    return this.handlePublicAPI('DemoActionID');
  }
}
