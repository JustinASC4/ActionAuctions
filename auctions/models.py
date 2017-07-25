from django.db import models
from django.db.models.signals import post_init
from django_future import schedule_job
# Create your models here.

class Auction(models.Model):
	auction_id = models.CharField(max_length=20, unique=True)
	charity = models.CharField(max_length=80)
	location = models.CharField(max_length=20)
	city = models.CharField(max_length=50)
	state = models.CharField(max_length=30)
	description = models.CharField(max_length=250)
	current_amount = models.IntegerField(default=0)
	highest_bidder = models.CharField(max_length=55, default="NONE")
	highest_bid = models.IntegerField(default=0)
	ending_time = models.DateTimeField()
	has_ended = models.BooleanField(default=False)
	winner_url = models.CharField(default="NONE", max_length=150)
	reimbursed = models.BooleanField(default=False)
	@classmethod
    def create(cls, auction_id, charity, location, city, state, description, current_amount, highest_bidder, highest_bid, ending_time, has_ended, winner_url, reimbursed):
        auction = cls(
        	auction_id=auction_id,
        	charity=charity,
        	location=location,
        	city=city,
        	state=state,
        	description=description,
        	current_amount=current_amount,
        	highest_bidder=highest_bidder,
        	highest_bid=highest_bid, 
        	ending_time=ending_time,
        	has_ended=has_ended,
        	winner_url=winner_url,
        	reimbursed=reimbursed
        )
        datetime = ending_time
		schedule_job(datetime, 'mysite.auctions.tasks.end_auction', content_object=auction)
        return auction

class Bid(models.Model):
	auction_id = models.CharField(max_length=20)
	amount = models.IntegerField()
	stripe_id = models.CharField(max_length=55)
	email = models.CharField(max_length=55)
	time = models.DateTimeField(auto_now=True)


def auction_init(**kwargs):
	auction = kwargs.get('instance')
	datetime = ''
	schedule_job(datetime, 'mysite.auctions.tasks.end_auction', content_object=auction)

post_init.connect(
    timelog_post_init,
    sender=TimeLog,
    dispatch_uid='auctions.signals.timelog_post_init',
)