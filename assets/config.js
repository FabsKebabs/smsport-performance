/*
  SM Sport Performance: business details
  ---------------------------------------
  Change the values between the quote marks and save the file. The whole website
  (buttons, contact details, opening hours and the details Google reads) updates
  from this one file.

  While the phone number is still 07000 000000, the site shows a yellow
  "Preview" bar at the top as a reminder that these details need filling in.
*/
window.SITE = {
  name: 'SM Sport Performance',

  // The website's address. Used when the site is shared and for Google.
  url: 'https://fabskebabs.github.io/smsport-performance/',

  // Phone number, written the way you want it shown on the site.
  phone: '07000 000000',

  // WhatsApp number: 44 followed by the mobile number without its first 0.
  // Example: 07123 456789 becomes '447123456789'.
  // Leave it as '' to hide every WhatsApp button.
  whatsapp: '447000000000',

  email: 'hello@smsportperformance.co.uk',

  address: {
    street: 'Unit 0, Example Industrial Estate',
    town: 'Town',
    postcode: 'AB1 2CD',
  },

  // Opening hours on the 24-hour clock, like '09:00-17:30'.
  // Use '' for a day you're closed.
  hours: {
    mon: '09:00-17:30',
    tue: '09:00-17:30',
    wed: '09:00-17:30',
    thu: '09:00-17:30',
    fri: '09:00-17:30',
    sat: '09:00-13:00',
    sun: '',
  },

  // Full links to your social pages, like 'https://www.instagram.com/yourname'.
  // Leave '' and that icon won't show.
  socials: {
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
  },
};
