from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired, Length, NumberRange

class ReviewForm(FlaskForm):
    comment = StringField("Review", validators=[DataRequired(), Length(min=5, max=800)])
    rating = IntegerField("Star Rating", validators=[DataRequired(), NumberRange(min=1, max=5)])
