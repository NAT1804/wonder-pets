import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _authConfig = signal<any>(null);

  public authConfig = this._authConfig.asReadonly();

  public async loadConfig(): Promise<void> {
    const response = await fetch('/assets/auth-config.json');
    const config = await response.json();
    this._authConfig.set(config);
  }
}
