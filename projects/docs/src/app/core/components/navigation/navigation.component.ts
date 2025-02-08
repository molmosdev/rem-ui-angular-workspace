import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ResponsiveService } from '../../../../../../lib/src/core/services/responsive.service';
import { VerticalNav } from '../../../../../../lib/src/core/components/vertical-nav/vertical-nav.component';
import { VerticalNavSection } from '../../../../../../lib/src/core/components/vertical-nav/components/vertical-nav-section/vertical-nav-section.component';
import { VerticalNavItem } from '../../../../../../lib/src/core/components/vertical-nav/components/vertical-nav-item/vertical-nav-item.component';
import { NavigationEnd, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { VerticalNavGroup } from '../../../../../../lib/src/core/components/vertical-nav/components/vertical-nav-group/vertical-nav-group.component';
import { BottomSheet } from '../../../../../../lib/src/core/components/bottom-sheet/bottom-sheet.component';
import { Button } from '../../../../../../lib/src/core/components/button/button.component';
import { fadeInFadeOutTrigger } from '../../../../../../lib/src/public-api';

@Component({
  selector: 'app-navigation',
  imports: [
    NgTemplateOutlet,
    VerticalNav,
    VerticalNavSection,
    VerticalNavItem,
    VerticalNavGroup,
    BottomSheet,
    Button,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
  animations: [fadeInFadeOutTrigger],
})
export class NavigationComponent implements OnInit {
  responsiveService = inject(ResponsiveService);
  isMobile = computed(
    () => this.responsiveService.currentDevice() === 'mobile'
  );
  router = inject(Router);
  routes = signal(this.router.config);
  componentsBottomSheet = signal(false);
  actualRouteData = signal(undefined);

  constructor() {
    effect(() => {
      console.log(this.routes());
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log(event.urlAfterRedirects);
        this.findRouteData(this.routes(), event.urlAfterRedirects);
      }
    });
  }

  findRouteData(routes: any[], url: string, accumulatedPath = ''): void {
    for (const route of routes) {
      const currentPath = this.getRoutePath(route, accumulatedPath);
      if (currentPath === url) {
        this.actualRouteData.set(route.data);
        return;
      }
      if (route.children) {
        this.findRouteData(route.children, url, currentPath);
      }
    }
  }

  getRoutePath(route: any, accumulatedPath = ''): string {
    return route.path ? `${accumulatedPath}/${route.path}` : accumulatedPath;
  }

  navigate(route: string): void {
    this.componentsBottomSheet.set(false);
    this.router.navigate([route]);
  }

  isSection(route: any): boolean {
    return route.data?.type === 'section';
  }

  isGroup(route: any): boolean {
    return route.data?.type === 'group';
  }
}
