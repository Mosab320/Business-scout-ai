"""Execution Agent: turns a validated opportunity into a concrete roadmap."""

WEEK_THEMES = {
    1: "Research & Setup",
    2: "Product / Service Preparation",
    3: "Branding & Marketing",
    4: "Launch & Optimization",
}

WEEK_TASK_TEMPLATES = {
    1: [
        ("Validate demand", "Talk to 10 potential customers about the idea and pricing."),
        ("Register the business basics", "Decide on a name and confirm any local requirements."),
        ("Source suppliers/tools", "Shortlist 2-3 suppliers or tools and compare pricing."),
        ("Set a budget breakdown", "Finalize the startup budget allocation."),
        ("Set up finances", "Open a simple way to track income and expenses."),
        ("Draft your offer", "Write a one-line description of what you sell and to whom."),
        ("Review week 1", "Note blockers and adjust the plan for week 2."),
    ],
    2: [
        ("Build/produce first batch", "Create your first product batch or service package."),
        ("Set pricing", "Finalize pricing using the finance estimate as a guide."),
        ("Create product photos/samples", "Capture clear photos or record a demo."),
        ("Set up sales channel", "Set up your store, marketplace listing, or booking flow."),
        ("Write core content", "Draft your bio, FAQ, and 3 starter social posts."),
        ("Get early feedback", "Share samples with 3-5 trusted contacts."),
        ("Review week 2", "Refine the offer based on feedback."),
    ],
    3: [
        ("Finalize branding", "Lock in your name, colors, and simple logo."),
        ("Build launch content", "Prepare launch posts, photos, and a short video."),
        ("Set launch offer", "Decide your founding-customer discount or bonus."),
        ("Warm up audience", "Start teasing the launch to your network."),
        ("Prepare fulfillment", "Confirm how orders/bookings will be delivered."),
        ("Line up first customers", "Get soft commitments from 3-5 people."),
        ("Review week 3", "Confirm everything is ready for launch."),
    ],
    4: [
        ("Launch publicly", "Announce across all chosen channels."),
        ("Run the launch offer", "Actively promote the founding-customer deal."),
        ("Collect first orders", "Fulfill and follow up on every order personally."),
        ("Gather reviews", "Ask early customers for a review or testimonial."),
        ("Track numbers", "Log sales, costs, and time spent daily."),
        ("Optimize based on data", "Double down on what's converting."),
        ("Plan month two", "Set goals for the next 30 days."),
    ],
}


async def run(opportunity_title: str) -> dict:
    launch_plan = []
    day_counter = 1
    for week in range(1, 5):
        for task, description in WEEK_TASK_TEMPLATES[week]:
            launch_plan.append(
                {
                    "day": day_counter,
                    "week": week,
                    "task": task,
                    "description": description,
                    "status": "pending",
                }
            )
            day_counter += 1

    return {
        "seven_day_plan": launch_plan[:7],
        "thirty_day_plan": launch_plan,
        "first_10_actions": [t["task"] for t in launch_plan[:10]],
        "required_resources": [
            "Starting budget allocated per the finance estimate",
            "A phone/camera for content",
            "A simple way to accept payments",
            "2-4 hours per day for the first month",
        ],
        "milestones": [
            f"Week 1: {WEEK_THEMES[1]} complete",
            f"Week 2: {WEEK_THEMES[2]} complete",
            f"Week 3: {WEEK_THEMES[3]} complete",
            f"Week 4: {WEEK_THEMES[4]} — first paying customers",
        ],
        "risks": [
            "Demand validation may take longer than expected",
            "Initial pricing may need adjustment after real feedback",
            "Fulfillment/delivery logistics can slip the timeline",
        ],
        "next_steps": [
            f"After 30 days, reassess {opportunity_title} against actual sales data",
            "Reinvest early profit into the highest-converting channel",
        ],
    }
