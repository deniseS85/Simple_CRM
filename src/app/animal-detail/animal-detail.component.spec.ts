import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalDetailComponent } from './animal-detail.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';


describe('AnimalDetailComponent', () => {
  let component: AnimalDetailComponent;
  let fixture: ComponentFixture<AnimalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({"projectId":"simple-crm-81f85","appId":"1:42929532343:web:114f439e3a4c9d10d00c32","storageBucket":"simple-crm-81f85.appspot.com","apiKey":"AIzaSyAmh3k8XdBQM1L7PkZCNwV12ToCmptF0rk","authDomain":"simple-crm-81f85.firebaseapp.com","messagingSenderId":"42929532343"})),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        RouterTestingModule, RouterModule, HttpClientModule, MatCardModule, MatIconModule, MatMenuModule
      ],
      declarations: [AnimalDetailComponent],
      providers: []
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
