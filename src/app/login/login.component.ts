import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { signInAnonymously, signInWithEmailAndPassword } from '@angular/fire/auth';
import { createUserWithEmailAndPassword } from '@firebase/auth';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  loading = false;
  isSignUp: boolean = false;
  isLogin: boolean = true;
  hideRequired ="true";
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  userNotFound: boolean = false;


  constructor(private router: Router, private formBuilder: FormBuilder, private authService: AuthService) {
      this.setSignUpForm();
      this.setLoginForm();
  }



  /**
   * Benuter wird als Gast angemeldet
   */
  async signInAnonymously() {
      this.loading = true;
      await signInAnonymously(this.authService.auth)
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
      })
      .finally(() => {
          this.loading = false;
          this.redirectUser();
      });
  }


   /**
   * Benutzer kann sich registrieren
   */
   async signUpUser() {
      this.loading = true;
  
      await createUserWithEmailAndPassword(this.authService.auth, this.signupForm.value.email, this.signupForm.value.password)
      .then((userCredential) => {
          const user = userCredential.user;
          this.loading = false;
          this.redirectUser(); 
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          this.userNotFound = true;
      })
  }


  /**
   * Benuter kann sich einloggen mit Email und Passwort
   */
  async signIn() {
      this.loading = true;

      await signInWithEmailAndPassword(this.authService.auth, this.loginForm.value.email, this.loginForm.value.password)
          .then((userCredential) => {
              const user = userCredential.user;
              this.loading = false;
              this.redirectUser();
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              this.userNotFound = true;
          });
  }

  /**
   * Weiterleitung zur Dashboard-Seite
   */
  redirectUser() {
      this.router.navigate(['/dashboard']);
  }


  /**
   * Weiterleitung zum Login
   */
  alreadyUser() {
      this.loginForm.reset();
      this.isSignUp = false;
      this.loading = false;
      this.userNotFound = false;
     
      


  }

  /**
   * Weiterleitung zum Sign-Up
   */
  addNewUser() {
    this.signupForm.reset();
    this.isSignUp = true;
    this.isLogin = false;
    this.loading = false;
    this.userNotFound = false;
    
    

}


  /**
   * Weiterleitung zur Auswahl für Login (1. Container)
   */
  navigateToLogInSelection() {
      this.loginForm.reset();
      this.isSignUp = false;
      this.isLogin = true;
  }


  /**
   * ruft entweder das Anmeldeformular oder das Registrierungsformular auf
   * @returns aktuelle Form
   */
  getForm() {
      return this.isSignUp ? this.signupForm : this.loginForm;
  }

  /**
   * erstellt das Registrierungsformular mit Validierung
   */
  setSignUpForm() {
      this.signupForm = this.formBuilder.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
          confirmPassword: ['', Validators.required],
      }, { validators: this.passwordMatchValidator });
  }


  /**
   * erstellt das Anmeldeformular
   */
  setLoginForm() {
      this.loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      });
  }


  /**
   * prüft, ob die Passwörter übereinstimmen
   * @param formGroup 
   * @returns wenn Übereinstimmung true, sonst null
   */
  passwordMatchValidator(formGroup: FormGroup) {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
  }
}


