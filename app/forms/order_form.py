from flask_wtf import FlaskForm
from wtforms import StringField, FloatField
from wtforms.validators import DataRequired, Length

class OrderForm(FlaskForm):
    product_items = StringField("Product Items", validators=[DataRequired(), Length(max=255)])
    total_cost = FloatField("Total Cost", validators=[DataRequired()])
