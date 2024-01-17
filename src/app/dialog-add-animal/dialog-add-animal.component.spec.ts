import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddAnimalComponent } from './dialog-add-animal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MatDialogRefMock {
  close() {}
}


describe('DialogAddAnimalComponent', () => {
  let component: DialogAddAnimalComponent;
  let fixture: ComponentFixture<DialogAddAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        provideFirebaseApp(() => initializeApp({"projectId":"simple-crm-81f85","appId":"1:42929532343:web:114f439e3a4c9d10d00c32","storageBucket":"simple-crm-81f85.appspot.com","apiKey":"AIzaSyAmh3k8XdBQM1L7PkZCNwV12ToCmptF0rk","authDomain":"simple-crm-81f85.firebaseapp.com","messagingSenderId":"42929532343"})),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        FormsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatRadioModule, MatInputModule, BrowserAnimationsModule
      ],
      declarations: [DialogAddAnimalComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
