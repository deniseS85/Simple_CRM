import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditAnimalComponent } from './dialog-edit-animal.component';

describe('DialogEditAnimalComponent', () => {
  let component: DialogEditAnimalComponent;
  let fixture: ComponentFixture<DialogEditAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogEditAnimalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
