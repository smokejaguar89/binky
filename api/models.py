from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Category(models.Model):
	name = models.CharField(max_length=200)

	def __str__(self):
		return self.name


class Skill(models.Model):
	name = models.CharField(max_length=200)
	categories = models.ManyToManyField(Category)

	def __str__(self):
		return self.name

class Location(models.Model):
	name = models.CharField(max_length=200)
	city_name = models.CharField(max_length=200, null=True)
	country_name = models.CharField(max_length=200, null=True)
	country_code = models.CharField(max_length=200, null=True)

	def __str__(self):
		return self.name

class University(models.Model):
	name = models.CharField(max_length=200)
	location = models.ForeignKey(Location)

	def __str__(self):
		return self.name

class UserProfile(models.Model):
	activation_key = models.CharField(max_length=40, null=True)
	key_expires = models.DateTimeField(null=True)
	img = models.CharField(max_length=200, blank=True)
	join_date = models.DateTimeField(auto_now_add=True)
	degree = models.CharField(max_length=200, blank=True)
	desc = models.CharField(max_length=1000, blank=True)

	uni = models.ForeignKey(University, blank=True, null=True)
	user = models.OneToOneField(User)
	skills = models.ManyToManyField(Skill, blank=True, null=True)

	def __str__(self):
		return self.user.email

class ProjectCategory(models.Model):
	name = models.CharField(max_length=200)

	def __str__(self):
		return self.name

class Project(models.Model):
	name = models.CharField(max_length=200)
	desc = models.CharField(max_length=1000)
	img = models.CharField(max_length=200)
	creation_date = models.DateTimeField(auto_now_add=True)

	categories = models.ManyToManyField(ProjectCategory)
	req_skills = models.ManyToManyField(Skill)
	members = models.ManyToManyField(User, related_name='projects')

	def __str__(self):
		return self.name

class Post(models.Model):
	content = models.CharField(max_length=1000)
	img = models.CharField(max_length=200, null=True)
	category = models.CharField(max_length=200)
	author = models.ForeignKey(User, related_name='posts', null=True)
	project = models.ForeignKey(Project, related_name='posts', null=True)
	creation_date = models.DateTimeField(auto_now_add=True)

class ProjectMembership(models.Model):
	member = models.ForeignKey(User)
	project = models.ForeignKey(Project)
	created = models.DateTimeField(auto_now_add=True, editable=False)
	validated = models.BooleanField(default=False)

class Chat(models.Model):
	users = models.ManyToManyField(User)
	creation_date = models.DateTimeField(auto_now_add=True)


class Message(models.Model):
	content = models.CharField(max_length=200)
	creation_date = models.DateTimeField(auto_now_add=True)
	user = models.ForeignKey(UserProfile, related_name='message')
	chat = models.ForeignKey(Chat, related_name="message")