import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>Calendar App</span>
    </mat-toolbar>
    <main class="app-container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
    .app-container {
      padding: 20px;
      height: calc(100% - 64px);
      overflow: auto;
      background-color: #fafafa;
    }
  `]
})
export class AppComponent {}
