export default class Event {
  public defaultPrevented = false;

  public preventDefault(): void {
    this.defaultPrevented = true;
  }
}
