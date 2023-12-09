import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, signInAnonymously, signInWithEmailAndPassword } from '@angular/fire/auth';


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

  constructor(private router: Router, private formBuilder: FormBuilder, private auth: Auth) {
      this.setSignUpForm();
      this.setLoginForm();
  }

  /**
   * Benuter wird als Gast angemeldet
   */
  async signInAnonymously() {
      await signInAnonymously(this.auth)
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
   * Weiterleitung zum Sign-Up
   */
  addNewUser() {
      this.signupForm.reset();
      this.isSignUp = true;
      this.isLogin = false;
  }

  /**
   * ruft entweder das Anmeldeformular oder das Registrierungsformular auf
   * @returns aktuelle Form
   */
  getForm() {
      return this.isSignUp ? this.signupForm : this.loginForm;
  }

  /**
   * erstellt das Anmeldeformular mit Validierung
   */
  setSignUpForm() {
      this.signupForm = this.formBuilder.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
          confirmPassword: ['', Validators.required],
      }, { validators: this.passwordMatchValidator } as AbstractControlOptions);
  }

  /**
   * prüft, ob die Passwörter übereinstimmen
   * @param formGroup 
   * @returns 
   */
  passwordMatchValidator(formGroup: FormGroup) {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * 
   */
  async signUpUser() {
    this.loading = true;
    await signInWithEmailAndPassword(this.auth, this.loginForm.value.email, this.loginForm.value.password)
    .then((userCredential) => {
      const user = userCredential.user;
      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    })
    .finally(() => {
      this.loading = false;
      this.redirectUser();
    });
  }

  setLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async signIn() {
    this.loading = true;
    await signInWithEmailAndPassword(this.auth, this.loginForm.value.email, this.loginForm.value.password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-login-credentials') {
          this.userNotFound = true;
        } else {
          console.log(error);
        }
      })
      .finally(() => {
        this.loading = false;
        this.redirectUser();
      });
  }
}
