import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from '../shared/services/auth/auth.service';
import { LoginData, SignUpData } from '../shared/services/auth/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  loginForm: FormGroup;
  signUpForm: FormGroup;
  modeSignIn = true;
  errorSignIn = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private location: Location, private router: Router) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.signUpForm = this.formBuilder.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.modeSignIn) {
      let data: LoginData = {
        email: this.loginForm.value['username'],
        password: this.loginForm.value['password']
      }
      this.authService.signIn(data).subscribe(res => {
        if (res) {
          localStorage.setItem("userDetails", JSON.stringify(res));
          this.router.navigate(['/activities']);
        } else {
          this.errorSignIn = true;
        }

      });
    } else {
      let data: SignUpData = {
        email: this.signUpForm.value['username'],
        fullName: this.signUpForm.value['fullName'],
        password: this.signUpForm.value['password']
      }

      this.authService.signUp(data).subscribe(res => {
        localStorage.setItem("userDetails", JSON.stringify(res));
        this.location.back();
      });
    }
    this.errorSignIn = false;
  }

  changeMode(mode: boolean) {
    this.modeSignIn = mode;
    if (mode) {
      this.loginForm.reset();
      this.errorSignIn = false;
    } else {
      this.signUpForm.reset();
      this.errorSignIn = false;
    }
  }
}
