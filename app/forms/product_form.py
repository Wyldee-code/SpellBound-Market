from flask_wtf import FlaskForm
from wtforms import SelectField, StringField, FloatField, TextAreaField
from wtforms.validators import DataRequired, Length, URL

product_categories = [
    "jewelry",
    "crystals",
    "art",
    "clothing",
    "home_decor",
    "spiritual_tools"
]

class ProductForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    type = SelectField("Category", choices=product_categories, validators=[DataRequired()])
    price = FloatField("Price", validators=[DataRequired()])
    description = TextAreaField("Description")  # Optional field
    image_url = StringField("Image URL", validators=[
        DataRequired(), URL(), Length(min=1, max=255)
    ])
