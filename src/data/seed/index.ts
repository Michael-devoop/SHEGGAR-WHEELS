/**
 * The seed dataset.
 *
 * One import for the whole set. `src/lib/storage/init.ts` loads it into the
 * browser stores on first run, and the `/dev/data` page shows the counts.
 *
 * Dates are relative to the day the demo is opened, so the booking timeline
 * always has work in progress. No passwords are stored here: sign-in is
 * email-only in this project.
 */
import type {
  Announcement,
  Booking,
  BookingStatus,
  Car,
  Dispute,
  ISODate,
  PaymentStatus,
  Review,
  User,
} from "@/types";
import { daysBetween, priceFor, timestampDaysFromToday } from "./helpers";

export { daysBetween, daysFromToday, priceFor, timestampDaysFromToday } from "./helpers";


export interface Seeds {
  users: User[];
  cars: Car[];
  bookings: Booking[];
  reviews: Review[];
  disputes: Dispute[];
  announcements: Announcement[];
}

function booking(input: {
  id: string;
  car: Car;
  renterId: string;
  startOffset: number;
  endOffset: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdOffset: number;
  updatedOffset: number;
}): Booking {
  const startDate: ISODate = timestampDaysFromToday(input.startOffset).slice(
    0,
    10,
  );
  const endDate: ISODate = timestampDaysFromToday(input.endOffset).slice(0, 10);
  const days = daysBetween(startDate, endDate);
  const { subtotal, fee, total } = priceFor(input.car.pricePerDay, days);

  return {
    id: input.id,
    carId: input.car.id,
    renterId: input.renterId,
    ownerId: input.car.ownerId,
    startDate,
    endDate,
    days,
    pricePerDay: input.car.pricePerDay,
    subtotal,
    fee,
    total,
    paymentStatus: input.paymentStatus,
    status: input.status,
    createdAt: timestampDaysFromToday(input.createdOffset),
    updatedAt: timestampDaysFromToday(input.updatedOffset),
  };
}

/** Build a fresh, date-relative seed set. */
export function getSeeds(): Seeds {
  const users: User[] = [
    {
      id: "usr_01",
      name: "Marta Bekele",
      email: "marta@example.com",
      phone: "+251911234501",
      roles: ["owner", "renter"],
      status: "active",
      createdAt: timestampDaysFromToday(-240),
    },
    {
      id: "usr_02",
      name: "Yonas Tadesse",
      email: "yonas@example.com",
      phone: "+251911234502",
      roles: ["renter"],
      status: "active",
      createdAt: timestampDaysFromToday(-180),
    },
    {
      id: "usr_03",
      name: "Selam Girma",
      email: "selam@example.com",
      phone: "+251911234503",
      roles: ["admin", "owner"],
      status: "active",
      createdAt: timestampDaysFromToday(-300),
    },
    {
      id: "usr_04",
      name: "Abel Kebede",
      email: "abel@example.com",
      phone: "+251911234504",
      roles: ["renter"],
      status: "suspended",
      createdAt: timestampDaysFromToday(-120),
    },
  ];

  const cars: Car[] = [
    {
      id: "car_01",
      ownerId: "usr_01",
      make: "Toyota",
      model: "Corolla",
      year: 2019,
      transmission: "automatic",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "Bole",
      latitude: 9.0192,
      longitude: 38.7525,
      pricePerDay: 2400,
      photos: ["/images/cars/car-01.jpg"],
      description:
        "Service history at a Toyota dealer in Bole. Air conditioning, reverse camera and a phone charger in the glove box. Pick up and drop off in the neighbourhood.",
      status: "approved",
      unavailableDates: [
        timestampDaysFromToday(5).slice(0, 10),
        timestampDaysFromToday(6).slice(0, 10),
        timestampDaysFromToday(7).slice(0, 10),
      ],
      createdAt: timestampDaysFromToday(-150),
    },
    {
      id: "car_02",
      ownerId: "usr_01",
      make: "Toyota",
      model: "Vitz",
      year: 2018,
      transmission: "automatic",
      seats: 4,
      city: "Addis Ababa",
      neighbourhood: "Piassa",
      latitude: 9.0256,
      longitude: 38.7469,
      pricePerDay: 1500,
      photos: ["/images/cars/car-02.jpg"],
      description:
        "Small and easy to park in Piassa, which is the point. Fuel efficient for short trips around the old quarter and Merkato.",
      status: "approved",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-145),
    },
    {
      id: "car_03",
      ownerId: "usr_01",
      make: "Hyundai",
      model: "Accent",
      year: 2020,
      transmission: "automatic",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "CMC",
      latitude: 9.0211,
      longitude: 38.7403,
      pricePerDay: 1800,
      photos: ["/images/cars/car-03.jpg"],
      description:
        "Roomy for the price. Bluetooth, reversing camera and a full tank at pickup. Easy to reach from CMC and the Piazza area.",
      status: "approved",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-140),
    },
    {
      id: "car_04",
      ownerId: "usr_03",
      make: "Mazda",
      model: "Demio",
      year: 2017,
      transmission: "manual",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "Kazanchis",
      latitude: 9.0152,
      longitude: 38.7452,
      pricePerDay: 1400,
      photos: ["/images/cars/car-04.jpg"],
      description:
        "Manual and reliable. Good on the climb out of Kazanchis towards Entoto. Recently serviced, new tyres.",
      status: "approved",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-135),
    },
    {
      id: "car_05",
      ownerId: "usr_03",
      make: "Nissan",
      model: "Note",
      year: 2019,
      transmission: "automatic",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "Sarbet",
      latitude: 9.0134,
      longitude: 38.7594,
      pricePerDay: 1700,
      photos: ["/images/cars/car-05.jpg"],
      description:
        "Folds the rear seats flat, which makes it the practical one for moving furniture or luggage between Sarbet and the northern suburbs.",
      status: "approved",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-130),
    },
    {
      id: "car_06",
      ownerId: "usr_01",
      make: "Toyota",
      model: "Corolla",
      year: 2016,
      transmission: "manual",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "CMC",
      latitude: 9.0195,
      longitude: 38.7392,
      pricePerDay: 1300,
      photos: ["/images/cars/car-06.jpg"],
      description:
        "Older Corolla, still in good order. Submitted for review with a fresh set of listing photos.",
      status: "pending",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-3),
    },
    {
      id: "car_07",
      ownerId: "usr_03",
      make: "Suzuki",
      model: "Swift",
      year: 2014,
      transmission: "manual",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "Megenagna",
      latitude: 8.9971,
      longitude: 38.7802,
      pricePerDay: 1100,
      photos: ["/images/cars/car-07.jpg"],
      description:
        "Rejected listing: the registration was not provided and the photo set was incomplete.",
      status: "rejected",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-90),
    },
    {
      id: "car_08",
      ownerId: "usr_01",
      make: "Toyota",
      model: "Hiace",
      year: 2019,
      transmission: "manual",
      seats: 7,
      city: "Addis Ababa",
      neighbourhood: "Ayat",
      latitude: 8.9901,
      longitude: 38.8044,
      pricePerDay: 3200,
      photos: ["/images/cars/car-08.jpg"],
      description:
        "Seven seater for family groups. Currently off the road for a service, so the listing is inactive.",
      status: "inactive",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-60),
    },
    {
      id: "car_09",
      ownerId: "usr_01",
      make: "Toyota",
      model: "Yaris",
      year: 2015,
      transmission: "automatic",
      seats: 5,
      city: "Addis Ababa",
      neighbourhood: "Bole",
      latitude: 9.0088,
      longitude: 38.7831,
      pricePerDay: 1200,
      photos: ["/images/cars/car-09.jpg"],
      description:
        "Draft listing. The owner has not finished the description or added the registration yet.",
      status: "draft",
      unavailableDates: [],
      createdAt: timestampDaysFromToday(-1),
    },
  ];

  const byId = (id: string): Car => {
    const car = cars.find((entry) => entry.id === id);
    if (!car) throw new Error(`Seed car ${id} is missing`);
    return car;
  };

  const bookings: Booking[] = [
    booking({
      id: "bkg_01",
      car: byId("car_01"),
      renterId: "usr_02",
      startOffset: 5,
      endOffset: 7,
      status: "requested",
      paymentStatus: "unpaid",
      createdOffset: -2,
      updatedOffset: -2,
    }),
    booking({
      id: "bkg_02",
      car: byId("car_03"),
      renterId: "usr_02",
      startOffset: 10,
      endOffset: 13,
      status: "confirmed",
      paymentStatus: "held",
      createdOffset: -4,
      updatedOffset: -3,
    }),
    booking({
      id: "bkg_03",
      car: byId("car_05"),
      renterId: "usr_02",
      startOffset: -2,
      endOffset: 1,
      status: "in_progress",
      paymentStatus: "held",
      createdOffset: -10,
      updatedOffset: -2,
    }),
    booking({
      id: "bkg_04",
      car: byId("car_02"),
      renterId: "usr_02",
      startOffset: -20,
      endOffset: -17,
      status: "completed",
      paymentStatus: "paid",
      createdOffset: -25,
      updatedOffset: -17,
    }),
    booking({
      id: "bkg_05",
      car: byId("car_04"),
      renterId: "usr_02",
      startOffset: -30,
      endOffset: -28,
      status: "reviewed",
      paymentStatus: "paid",
      createdOffset: -35,
      updatedOffset: -27,
    }),
    booking({
      id: "bkg_06",
      car: byId("car_07"),
      renterId: "usr_02",
      startOffset: 3,
      endOffset: 5,
      status: "declined",
      paymentStatus: "unpaid",
      createdOffset: -6,
      updatedOffset: -5,
    }),
    booking({
      id: "bkg_07",
      car: byId("car_01"),
      renterId: "usr_02",
      startOffset: -12,
      endOffset: -10,
      status: "cancelled",
      paymentStatus: "refunded",
      createdOffset: -18,
      updatedOffset: -16,
    }),
    booking({
      id: "bkg_08",
      car: byId("car_03"),
      renterId: "usr_02",
      startOffset: -15,
      endOffset: -12,
      status: "disputed",
      paymentStatus: "held",
      createdOffset: -20,
      updatedOffset: -11,
    }),
    booking({
      id: "bkg_09",
      car: byId("car_05"),
      renterId: "usr_02",
      startOffset: -40,
      endOffset: -37,
      status: "resolved",
      paymentStatus: "refunded",
      createdOffset: -50,
      updatedOffset: -34,
    }),
    booking({
      id: "bkg_10",
      car: byId("car_01"),
      renterId: "usr_02",
      startOffset: -55,
      endOffset: -52,
      status: "reviewed",
      paymentStatus: "paid",
      createdOffset: -60,
      updatedOffset: -51,
    }),
  ];

  const reviews: Review[] = [
    {
      id: "rev_01",
      bookingId: "bkg_05",
      carId: "car_04",
      renterId: "usr_02",
      ownerId: "usr_03",
      rating: 5,
      comment:
        "The Demio was exactly as described and Selam was easy to deal with. Collected it from Kazanchis in ten minutes.",
      createdAt: timestampDaysFromToday(-27),
    },
    {
      id: "rev_02",
      bookingId: "bkg_10",
      carId: "car_01",
      renterId: "usr_02",
      ownerId: "usr_01",
      rating: 4,
      comment:
        "Car was clean and the handover was quick. Only note: the air conditioning took a few minutes to cool down.",
      ownerReply:
        "Thank you for the feedback. The air conditioning is serviced every year, it just needs a moment on a hot afternoon.",
      createdAt: timestampDaysFromToday(-51),
    },
  ];

  const disputes: Dispute[] = [
    {
      id: "dsp_01",
      bookingId: "bkg_08",
      openedBy: "usr_02",
      reason: "Vehicle condition",
      description:
        "The rear bumper and the left tail light were already damaged when I collected the car, and I have photos from the pickup. I would like the damage recorded so it is not charged to me at return.",
      status: "open",
      createdAt: timestampDaysFromToday(-11),
    },
    {
      id: "dsp_02",
      bookingId: "bkg_09",
      openedBy: "usr_02",
      reason: "Late return",
      description:
        "I returned the car about three hours after the agreed handover time because of traffic on the way back from the hotel. I would like the late return charge reviewed.",
      status: "resolved",
      resolutionNotes:
        "Traffic delay confirmed from the airport handover log, and the charge was waived. The renter was refunded in full and the owner was notified.",
      resolvedBy: "usr_03",
      createdAt: timestampDaysFromToday(-36),
      resolvedAt: timestampDaysFromToday(-34),
    },
  ];

  const announcements: Announcement[] = [
    {
      id: "ann_01",
      title: "Pick-up times after 8pm",
      message:
        "Owners handing over a car after 8pm please meet at the agreed point with the lights on. Share the arrival time in the booking thread so the renter is not left waiting.",
      active: true,
      createdAt: timestampDaysFromToday(-9),
      createdBy: "usr_03",
    },
    {
      id: "ann_02",
      title: "Monthly fee promotion",
      message:
        "The platform commission was reduced for the whole of last month. The standard 10% applies again from today.",
      active: false,
      createdAt: timestampDaysFromToday(-35),
      createdBy: "usr_03",
    },
  ];

  return { users, cars, bookings, reviews, disputes, announcements };
}

/**
 * Eager copies for the data layer, which reads the seed before the browser
 * store is populated. `getSeeds()` stays available for the seeding path.
 */
const initial = getSeeds();

export const seedUsers = initial.users;
export const seedCars = initial.cars;
export const seedBookings = initial.bookings;
export const seedReviews = initial.reviews;
export const seedDisputes = initial.disputes;
export const seedAnnouncements = initial.announcements;
