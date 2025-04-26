from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField
from wtforms.validators import DataRequired, Email, ValidationError
from app.models import User


def user_exists(form, field):
    """Check if the user exists by email."""
    email = field.data
    user = User.query.filter(User.email == email).first()
    if not user:
        raise ValidationError('Email provided not found.')


def password_matches(form, field):
    """Check if the password is correct for the provided email."""
    password = field.data
    email = form.data['email']
    user = User.query.filter(User.email == email).first()
    if not user:
        raise ValidationError('No such user exists.')
    if not user.check_password(password):
        raise ValidationError('Password was incorrect.')


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email(), user_exists])
    password = StringField('Password', validators=[DataRequired(), password_matches])


# Optional: Move to a separate form later if unrelated
class WalletForm(FlaskForm):
    amount = DecimalField("Amount")
