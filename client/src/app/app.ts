import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, Header],
  templateUrl: './app.html',
  styleUrl: './app.sass',  
})
export class App {
  protected readonly title = signal('MoneyDiary');
}
