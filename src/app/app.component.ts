import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentTestComponent } from './features/component-test/component-test.component';

@Component({
  selector: 'app-root',
  imports: [ComponentTestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rxjs-graph';
}
