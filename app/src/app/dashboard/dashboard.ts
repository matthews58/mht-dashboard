import { Component } from '@angular/core';
import { CoachInviteList } from '../coach-invites/coach-invite-list/coach-invite-list';
import { TabGroup } from '../shared/tab-group/tab-group';
import { Tab } from '../shared/tab-group/tab';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlayerList } from '../players/player-list/player-list';
import { VideoAssignmentList } from "../video-assignments/video-assignment-list/video-assignment-list";

@Component({
  selector: 'app-dashboard',
  imports: [TabGroup, Tab, CoachInviteList, MatProgressSpinnerModule, PlayerList, VideoAssignmentList],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
}
