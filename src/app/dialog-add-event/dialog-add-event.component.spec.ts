import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddEventComponent } from './dialog-add-event.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

describe('DialogAddEventComponent', () => {
  let component: DialogAddEventComponent;
  let fixture: ComponentFixture<DialogAddEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getFirestore, provideFirestore,
        provideFirebaseApp(() => initializeApp({"projectId":"simple-crm-81f85","appId":"1:42929532343:web:114f439e3a4c9d10d00c32","storageBucket":"simple-crm-81f85.appspot.com","apiKey":"AIzaSyAmh3k8XdBQM1L7PkZCNwV12ToCmptF0rk","authDomain":"simple-crm-81f85.firebaseapp.com","messagingSenderId":"42929532343"}))],
      declarations: [DialogAddEventComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
