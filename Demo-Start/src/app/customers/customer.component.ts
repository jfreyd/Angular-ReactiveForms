import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn} from '@angular/forms'

import { Customer } from './customer';

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }

  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { 'match': true };
}



function ratingRange(min: number, max: number) : ValidatorFn {
  return (c:AbstractControl) : { [key: string]: boolean} | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return {'range':true};
    }
    return null;
  };
}
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();
  emailMessage: string;

  private validationMessages = {
    required: 'Please enter your email address',
    email:  'Please enter a valid email address'
  };

  constructor(private fb: FormBuilder) { 

  }

  ngOnInit() {
    console.log("Branch on Github");
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]], 
        confirmEmail:['', Validators.required],  
      }, {validator: emailMatcher} ),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5) ],
      sendCatalog: true
    });

    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
     );

     const emailControl = this.customerForm.get('emailGroup.email');
      emailControl.valueChanges.subscribe(
        value => this.setMessage(emailControl)
      );
  }

  populateTestData() {
    this.customerForm.patchValue({
      firstName: "Jack",
      lastName: "Harkness",
      sendCatalog: false
    });
  }
  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setMessage(c: AbstractControl): void {
    console.log("Entering setMessage");
    this.emailMessage = '';
    if((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
      console.log(this.emailMessage);
    }
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    console.log("notifyVia: " + notifyVia);
    if(notifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
//      console.log("text");
    } else {
//     console.log("Not text or email");
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

}
