"""Marketing Agent: generates a go-to-market plan for an opportunity."""


async def run(profile: dict, market_result: dict) -> dict:
    channel = profile.get("sales_channel", "online_store")
    city = profile.get("city", "your city")

    persona = {
        "name": "The Practical Buyer",
        "summary": (
            f"Budget-conscious, time-poor customers in {city} who value convenience "
            "and trust recommendations from people they know."
        ),
        "age_range": "24-45",
        "primary_motivation": "Save time or solve a specific recurring problem",
    }

    channels = _channels_for(channel)

    return {
        "target_audience": persona["summary"],
        "customer_persona": persona,
        "marketing_channels": channels,
        "content_strategy": [
            "Before/after or process videos showing the product or service in action",
            "Customer testimonials and reviews as social proof",
            "Educational posts addressing common customer questions",
        ],
        "social_media_strategy": (
            "Post 3-4x per week focused on short-form video and behind-the-scenes "
            "content; engage actively in relevant local community groups."
        ),
        "launch_campaign": (
            "Run a 2-week 'founding customer' launch offer with a modest discount "
            "in exchange for reviews and referrals."
        ),
        "suggested_ad_budget": round(profile["budget"] * 0.1, 2),
        "customer_acquisition_ideas": [
            "Referral incentive for existing customers",
            "Local partnerships or cross-promotions",
            "Search-intent content (how-to / comparison posts)",
        ],
    }


def _channels_for(primary_channel: str) -> list[str]:
    mapping = {
        "online_store": ["Own website/store", "Instagram", "Google Search Ads"],
        "marketplace": ["Marketplace listings (Daraz/Amazon-style)", "Instagram", "TikTok"],
        "social_media": ["Instagram", "TikTok", "Facebook groups"],
        "physical_store": ["Local foot traffic", "Google Maps/Local SEO", "Flyers/local ads"],
        "b2b": ["LinkedIn outreach", "Email campaigns", "Referral partnerships"],
        "services": ["Word of mouth/referrals", "LinkedIn", "Local service directories"],
    }
    return mapping.get(primary_channel, ["Instagram", "Google Search", "Referrals"])
