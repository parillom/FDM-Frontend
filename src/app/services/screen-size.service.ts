import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {

  private isScreenExtraSmallSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isScreenExtraSmall$: Observable<boolean> = this.isScreenExtraSmallSubject.asObservable();

  private isScreenSmallSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isScreenSmall$: Observable<boolean> = this.isScreenSmallSubject.asObservable();

  private isScreenMiddleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isScreenMiddle$: Observable<boolean> = this.isScreenMiddleSubject.asObservable();

  private isScreenLargeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isScreenLarge$: Observable<boolean> = this.isScreenLargeSubject.asObservable();

  private isScreenExtraLargeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isScreenExtraLarge$: Observable<boolean> = this.isScreenExtraLargeSubject.asObservable();

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    const screenWidth = window.innerWidth;

    this.isScreenExtraSmallSubject.next(screenWidth < 576);

    this.isScreenSmallSubject.next(screenWidth >= 576 && screenWidth < 768);

    this.isScreenMiddleSubject.next(screenWidth >= 768 && screenWidth < 992);

    this.isScreenLargeSubject.next(screenWidth >= 992 && screenWidth < 1200);

    this.isScreenExtraLargeSubject.next(screenWidth >= 1200);
  }

}
