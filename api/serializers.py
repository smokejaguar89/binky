from rest_framework import serializers
from api.models import Category, Skill, UserProfile, Project, ProjectMembership, Chat, Message, ProjectCategory, University, Location, Post
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
import hashlib
import random
from django.core.mail import send_mail
import datetime


class CategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Category
        fields = ('url', 'id', 'name')

class ProjectCategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ('url', 'id', 'name')

class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ('url', 'id', 'name', 'city_name', 'country_name', 'country_code')

class UniversitySerializer(serializers.HyperlinkedModelSerializer):
    location = LocationSerializer()

    class Meta:
        model = University
        fields = ('url', 'id', 'name', 'location')

class SkillSerializer(serializers.HyperlinkedModelSerializer):
    categories = CategorySerializer(many=True)

    class Meta:
        model = Skill
        fields = ('url', 'id', 'name', 'categories')

class PostSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Post
        fields = ('url', 'id', 'content', 'img', 'creation_date', 'author', 'project', 'category')

class UserProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)
    uni = UniversitySerializer(many=False)
    user = serializers.PrimaryKeyRelatedField(many=False, read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'img', 'uni', 'degree', 'desc', 'skills', 'user')
        extra_kwargs = {
            'uni' : {
                'required' : False,
                'allow_blank': True,
                'allow_null': True
            },
            'skills' : {
                'required' : False,
                'allow_blank': True,
                'allow_null': True
            }
        }

class UserSerializer(serializers.HyperlinkedModelSerializer):
    userprofile = UserProfileSerializer()
    # posts = PostSerializer(many=True)

    class Meta:
        model = User
        depth = 1
        fields = ('url', 'id', 'username', 'first_name', 'last_name', 'email', 'userprofile', 'password', 'projects', 'posts')
        extra_kwargs = { 'password': {'write_only': True} }

    def create(self, validated_data):

        # Creates user and user profile
        password = validated_data.pop('password')

        if validated_data.get('userprofile', None):
            profile_data = validated_data.pop('userprofile')
            uni = profile_data.pop("uni")
            skills = profile_data.pop("skills")

        user = User.objects.create(**validated_data)
        user.is_active = False
        user.set_password(password)
        user.save()

        if profile_data:
            profile = UserProfile.objects.create(user=user, **profile_data)
            profile.uni = UniversitySerializer(data=uni)
            profile.skills = SkillSerializer(data=skills)

        # Creates activation key and sets expiry
        salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
        profile.activation_key = hashlib.sha1(salt+user.username).hexdigest()
        profile.key_expires=datetime.datetime.strftime(
            datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
        profile.save()

        # E-Mails activation key
        send_mail(
            'Your activation key',
            'http://127.0.0.1:8000/activate/' + user.userprofile.activation_key,
            'theologue@gmail.com',
            [user.email, 'theologue@gmail.com'],
            fail_silently=False,
        )

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('userprofile')
        profile = instance.userprofile

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        if validated_data['password']:
            if not instance.check_password(validated_data['password']):
                instance.set_password(validated_data['password'])

        instance.save()

        profile.img = profile_data.get('img', profile.img)
        profile.uni = profile_data.get('uni', profile.uni)
        profile.degree = profile_data.get('degree', profile.degree)
        profile.desc = profile_data.get('desc', profile.desc)

        profile.skills = profile_data.get('skills', profile.skills)

        return instance

class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    #members = serializers.HyperlinkedRelatedField(many=True, read_only=False, view_name="user-detail", queryset=User.objects.all())
    categories = ProjectCategorySerializer(many=True)
    req_skills = SkillSerializer(many=True)
    members = UserSerializer(many=True)
    #req_skills = serializers.HyperlinkedRelatedField(many=True, read_only=False, view_name="skill-detail", queryset=Skill.objects.all())
    #categories = serializers.HyperlinkedRelatedField(many=True, read_only=False, view_name="projectcategory-detail", queryset=ProjectCategory.objects.all())

    def to_internal_value(self, data):
         self.fields['req_skills'] = serializers.PrimaryKeyRelatedField(many=True, queryset=Skill.objects.all())
         self.fields['members'] = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all())
         self.fields['categories'] = serializers.PrimaryKeyRelatedField(many=True, queryset=ProjectCategory.objects.all())
         return super(ProjectSerializer, self).to_internal_value(data)

    def create(self, validated_data):
        new_project = Project.objects.create(
            name=validated_data['name'],
            desc=validated_data['desc'],
            img=validated_data['img'])
        new_project.members.add(validated_data['user'].userprofile)

        return new_project   

    class Meta:
        depth = 1
        model = Project
        fields = ('url', 'id', 'name', 'desc', 'img', 'creation_date', 'req_skills', 'members', 'categories', 'posts')
        read_only_fields = ('url', 'id', 'creation_date')


class ProjectMembershipSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.HyperlinkedRelatedField(many=False, view_name="user-detail", queryset=UserProfile.objects.all())
    project = serializers.HyperlinkedRelatedField(many=False, view_name="project-detail", queryset=Project.objects.all())

    class Meta:
        model = ProjectMembership
        fields = ('url', 'id', 'user', 'project', 'created', 'validated')


class ChatSerializer(serializers.HyperlinkedModelSerializer):
    users = serializers.HyperlinkedRelatedField(many=True, view_name="user-detail", queryset=UserProfile.objects.all())

    class Meta:
        model = Chat
        fields = ('url', 'id', 'users', 'creation_date')


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.HyperlinkedRelatedField(many=False, view_name="user-detail", read_only=True)
    chat = serializers.HyperlinkedRelatedField(many=False, view_name="chat-detail", read_only=True)

    class Meta:
        model = Message
        fields = ('url', 'id', 'user', 'chat', 'content', 'creation_date')