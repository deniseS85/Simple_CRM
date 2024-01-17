import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditUserComponent } from './dialog-edit-user.component';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../models/user.class';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


class MatDialogRefMock {
  close() {}
}

describe('DialogEditUserComponent', () => {
  let component: DialogEditUserComponent;
  let fixture: ComponentFixture<DialogEditUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({"projectId":"simple-crm-81f85","appId":"1:42929532343:web:114f439e3a4c9d10d00c32","storageBucket":"simple-crm-81f85.appspot.com","apiKey":"AIzaSyAmh3k8XdBQM1L7PkZCNwV12ToCmptF0rk","authDomain":"simple-crm-81f85.firebaseapp.com","messagingSenderId":"42929532343"})),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, FormsModule, MatInputModule, BrowserAnimationsModule
      ],
      declarations: [DialogEditUserComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditUserComponent);
    component = fixture.componentInstance;
    component.user = new User();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
