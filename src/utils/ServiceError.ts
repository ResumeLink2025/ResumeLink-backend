export class ServiceError extends Error {
  constructor(
    public readonly status: number, 
    message: string
  ) {
    super(message);
    this.name = 'ServiceError';
    
    // Error 클래스를 상속할 때 프로토타입 체인 복원
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}
