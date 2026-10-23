-- Rewrite the prototype's public wording in place.
-- Run this once in the Supabase SQL editor. It does not delete pledges,
-- change item quantities, change money goals, or publish the draft.
-- A second run matches nothing, because the old titles are already gone.
-- Do not run supabase/seed.sql for this. That script refuses to run once pledges exist.

update public.organizations
set
  name = 'Setu Community Collective',
  description = 'Fictional organisation for the SevaBridge prototype. It is not a registered NGO, and these campaigns are not real appeals.'
where name = 'SevaBridge Demo Collective';

update public.campaigns set
  title = 'Learning supplies for an evening centre in Pune',
  summary = 'The Kothrud evening centre needs 80 ruled notebooks and 150 pencils for children who study there.',
  description = 'The centre holds a free study hour on weekdays in Kothrud, Pune. Children often share one notebook. The request is 80 ruled notebooks and 150 pencils, collected in person. A pledge is not an item received. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/cause-education.jpg'
where title = 'Notebooks for the evening study centre';

update public.campaigns set
  title = 'Notebooks for an after-school class in Nagpur',
  summary = 'An after-school class in Nagpur is asking for 40 notebooks and 100 pencils.',
  description = 'The class meets after school in Nagpur and is short of stationery. The request is 40 notebooks and 100 pencils, handed over in person. A pledge is recorded here and counts as received only after the organisation confirms it. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/supplies.jpg'
where title = 'Demo: notebooks for an after-school class';

update public.campaigns set
  title = 'Water bottles for a Saturday class in Pune',
  summary = 'A Saturday class in Pune is asking for 12 reusable water bottles.',
  description = 'The class meets in a community room and has asked for 12 bottles so children can carry drinking water. Nothing is shipped through this site. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/bottle.jpg'
where title = 'Demo: water bottles for a workshop';

update public.campaigns set
  title = 'A week of meals for a community kitchen',
  summary = 'A kitchen in Pune is raising ₹25,000 for rice, dal and fuel for one week of meals.',
  description = 'The kitchen serves a weekday lunch. This goal is for rice, dal, oil and cooking fuel for about a week. SevaBridge does not collect the money. The organisation receives it in person. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/meals.jpg'
where title = 'Demo: rice purchase fund';

update public.campaigns set
  title = 'Rice and dal for the Hadapsar weekly kitchen',
  summary = 'The weekly kitchen in Hadapsar, Pune, has an ₹18,000 goal for rice, dal and oil.',
  description = 'Volunteers cook one large meal a week in Hadapsar. This goal is separate from the week-of-meals campaign and covers rice, dal and oil. No payment is taken on this site. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/dal.jpg'
where title = 'Rice for the weekly community kitchen';

update public.campaigns set
  title = 'Restoring a neighbourhood reading room in Pune',
  summary = 'The reading room needs 8 tarpaulin sheets before the rains and ₹15,000 for repairs.',
  description = 'Children and neighbours use the room in the evenings. The roof leaks, so the request is 8 tarpaulin sheets plus ₹15,000 for patching and mats. Items and money stay separate, and neither counts as received until the organisation confirms the handover. This is an illustrative campaign for the SevaBridge prototype, not a real appeal.',
  cover_image_url = '/images/library.jpg'
where title = 'Repair the neighbourhood reading room';

update public.campaigns set
  title = 'Essential supplies for a rural health camp',
  summary = 'Unpublished draft for hygiene kits and basic supplies. It must stay off the public site.',
  description = 'A community health day would ask for hygiene kits and other non-prescription supplies. This row is a draft and is not a public campaign. It is illustrative, not a real appeal.',
  cover_image_url = '/images/cause-healthcare.jpg'
where title = 'Demo draft: neighbourhood clinic day'
  and status = 'draft';

update public.campaign_updates set
  title = 'The after-school class list is open',
  body = 'The campaign is published so a pledge can be recorded. No distribution has been organised. This is a prototype note.'
where title = 'Demo update: campaign opened';

update public.campaign_updates set
  title = 'Two notebooks marked received',
  body = 'The organisation confirmed two notebooks after a recorded handover. That confirmation is a prototype entry, not a report of a wider distribution.'
where title = 'Demo update: first notebooks received';
