import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({"projectId":"simple-crm-81f85","appId":"1:42929532343:web:114f439e3a4c9d10d00c32","storageBucket":"simple-crm-81f85.appspot.com","apiKey":"AIzaSyAmh3k8XdBQM1L7PkZCNwV12ToCmptF0rk","authDomain":"simple-crm-81f85.firebaseapp.com","messagingSenderId":"42929532343"})),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        MatCardModule, MatIconModule
      ],
      declarations: [DashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
