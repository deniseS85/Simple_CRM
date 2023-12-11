import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddAnimalComponent } from './dialog-add-animal.component';

describe('DialogAddAnimalComponent', () => {
  let component: DialogAddAnimalComponent;
  let fixture: ComponentFixture<DialogAddAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogAddAnimalComponent]
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
