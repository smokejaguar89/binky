from rest_framework.response import Response
from django.http import HttpResponse
from api.models import Category, Skill, UserProfile, Project, ProjectMembership, Chat, Message, ProjectCategory, Location, University, Post
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from api.serializers import CategorySerializer, SkillSerializer, UserSerializer, UserProfileSerializer, ProjectSerializer, ProjectMembershipSerializer, ChatSerializer, MessageSerializer, ProjectCategorySerializer, LocationSerializer, UniversitySerializer, PostSerializer
from rest_framework import permissions
from api.permissions import IsOwnerOrReadOnly, IsUserOrReadOnly, IsAuthorOrReadOnly
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.reverse import reverse
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core import serializers
from rest_framework.renderers import JSONRenderer
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username', None)
    password = request.data.get('password', None)

    if username and password:
        user = authenticate(username=username, password=password)
    else:
        return Response({ 'success' : False }, status=status.HTTP_400_BAD_REQUEST)

    if user is not None:
        login(request, user)
        return Response(
            { 'success' : True, 
              'user' : 
                { 'id' : user.id, 
                  'email' : user.email, 
                  'name' : user.first_name + " " + user.last_name } 
            }, status=status.HTTP_200_OK)
    else:
        return Response({ 'success' : False }, status=status.HTTP_400_BAD_REQUEST)

@api_view()
def logout_user(request):
    logout(request)

    return Response({ 'success' : True }, status=status.HTTP_200_OK)

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'projects': reverse('snippet-list', request=request, format=format)
    })

@api_view(['GET'])
def recommended_projects(request):

    user = User.objects.get(pk=request.user.id)

    if user:
        uni = user.userprofile.uni
        location = user.userprofile.uni.location
        skill_ids = [x.id for x in user.userprofile.skills.all()]

        accuracy = 'high'

        results = Project.objects.filter(
                members__userprofile__uni__location = location,
                req_skills__in = skill_ids,
            ).exclude(members=user)

        if len(results) == 0:
            results = Project.objects.filter(
                req_skills__in = skill_ids
            ).exclude(members=user)

            accuracy = 'medium'

        if len(results) == 0:
            results = Project.objects.filter(
                members__userprofile__uni__location = location
            ).exclude(members=user)

            accuracy = 'low'

        serializer = ProjectSerializer(results, many=True, context={'request': request})

        return Response({
            'accuracy': accuracy,
            'results': serializer.data,
            'id' : request.user.id
        }, status=status.HTTP_200_OK)

    else:
        return Response({
            'error' : 'user not found'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def activate_user(request, key, format=None):
    profile = get_object_or_404(UserProfile, activation_key=key)

    if profile.user.is_active == False:
        if timezone.now() > profile.key_expires:
            return Response({
                'status': 'Bad request',
                'message': 'Profile key has expired.'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            profile.user.is_active = True
            profile.user.save()

            return Response({
            'status': 'Success',
            'message': 'User activated'
        }, status=status.HTTP_201_CREATED)

    else:
        return Response({
            'status': 'Bad request',
            'message': 'User is already active.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def new_activation_token(request, format=None):

    user = request.user

    if not user.is_active:
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
        return Response({
            'status': 'Success',
            'message': 'New activation key sent to ' + user.email
        }, status=status.HTTP_201_CREATED)

    else:
        return Response({
            'status': 'Bad request',
            'message': 'User is already active'
        }, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProjectCategoryViewSet(viewsets.ModelViewSet):

    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer

class LocationViewSet(viewsets.ModelViewSet):

    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class UniversityViewSet(viewsets.ModelViewSet):

    queryset = University.objects.all()
    serializer_class = UniversitySerializer

class SkillViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Skill.objects.all()
        categories = self.request.query_params.get('categories', None)

        if categories is not None:
            value_list = categories.split(',')
            queryset = queryset.filter(categories__id__in=value_list)

        return queryset

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsAuthorOrReadOnly,)

    def perform_create(self, serializer):
        if serializer.is_valid():
            if self.request.user and User.objects.filter(id=self.request.user.id).exists():
                serializer.save(author=self.request.user)
                return Response(
                    serializer.validated_data, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'status': 'Bad request',
                    'message': 'Please log in.'
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'status': 'Bad request',
            'message': 'Account could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)

class ProjectViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.

    Additionally we also provide an extra `highlight` action.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsOwnerOrReadOnly,)

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)

            return Response(
                serializer.validated_data, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'Bad request',
            'message': 'Account could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Project.objects.all()
        req_skills = self.request.query_params.get('req_skills', None)
        members = self.request.query_params.get('members', None)
        location = self.request.query_params.get('location', None)
        categories = self.request.query_params.get('categories', None)

        if req_skills is not None:
            value_list = req_skills.split(',')
            queryset = queryset.filter(req_skills__id__in=value_list)

        if location is not None:
            queryset = queryset.filter(members__userprofile__uni__location__id=location)

        if members is not None:
            value_list = members.split(',')
            queryset = queryset.filter(members__id__in=value_list)

        if categories is not None:
            value_list = categories.split(',')
            queryset = queryset.filter(categories__id__in=value_list)

        return queryset

class UserViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
                          IsUserOrReadOnly,)

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = User.objects.all()
        skills = self.request.query_params.get('skills', None)
        location = self.request.query_params.get('location', None)
        uni = self.request.query_params.get('uni', None)
        degree = self.request.query_params.get('degree', None)
        email = self.request.query_params.get('email', None)

        if skills is not None:
            value_list = skills.split(',')
            queryset = queryset.filter(userprofile__skills__id__in=value_list)

        if location is not None:
            queryset = queryset.filter(userprofile__uni__location__id=location)

        if uni is not None:
            queryset = queryset.filter(userprofile__uni=uni)

        if degree is not None:
            queryset = queryset.filter(userprofile__degree=degree)

        if email is not None:
            queryset = queryset.filter(email=email)

        return queryset

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `detail` actions.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer