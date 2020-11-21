import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {visibility,flyInOut,expand} from '../animation/app.animation';
@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.css'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand(),
    ]
  
})
export class DishdetailComponent implements OnInit {

  @ViewChild('fform') commentFormDirective;

  errMess: string;
  commentForm: FormGroup;
  dish: Dish;
  dishcopy: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  visibility = 'shown';

  cmntformErrors = {
    'name': '',
    'comment': '',
  };

  validationMessages = {
    'name': {
      'required':      'Author Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      "Author's Comment is required."
    }
  }
  feedback: Comment;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,private fb: FormBuilder,
    @Inject('BaseURL') private baseURL) {
      this.createForm();
    }

  ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
        errmess => this.errMess = <any>errmess);
        this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
        .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
          errmess => this.errMess = <any>errmess);
      
    
 }
 createForm() {
  
  this.commentForm = this.fb.group({
    author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
    comment: ['', Validators.required ],
    rating: ['5'],
    date: [this.getdate()],
  }); 
  this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

  this.onValueChanged(); // (re)set validation messages now
}
onValueChanged(data?: any) {
  if (!this.commentForm) { return; }
  const form = this.commentForm;
  for (const field in this.cmntformErrors) {
    if (this.cmntformErrors.hasOwnProperty(field)) {
      // clear previous error message (if any)
      this.cmntformErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            console.log(key);
            console.log(messages[key]);
            this.cmntformErrors[field] += messages[key] + ' ';
            console.log(this.cmntformErrors[field]);
          }
        }
      }
    }
  }
}
 

onSubmit() {
  //this.feedback = this.feedbackForm.value;
  //console.log(this.feedback);
  
  
  this.dish.comments.push(this.commentForm.value);
  this.dishservice.putDish(this.dishcopy)
  .subscribe(dish => {
    this.dish = dish; this.dishcopy = dish;
  },
  errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
  this.commentFormDirective.resetForm();
  this.commentForm.reset({

    author: '',
    comment: '',
    rating: '5',
    date: this.getdate(),
  });
  
}




  setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      console.log(this.prev);
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
   
  goBack(): void {
    this.location.back();
  }
  getdate(){
    var d=new Date();
  var n = d.toISOString();
  return n;
  }

}

