# Baseline timetable

[baseline_timetable.csv](baseline_timetable.csv) is a synthetic, zero-buffer timetable created for this model on 22 November 2026. Each row describes one train movement. The times are local clock times on one model day. The clock times are constructed to give a zero-buffer crossing at 10:00. Segment durations use historical published Podi Menike schedules as proxies and include any intermediate stops.

Peradeniya Junction and Nawalapitiya are the endpoints. Gampola is the modelled crossing station. The project author confirmed on 22 November 2026 that it can accommodate two trains simultaneously. Other intermediate stops are grouped into the two model segments. Sri Lanka Railways lists Gampola between the endpoints. [Main Line station list](https://www.railway.gov.lk/web/index.php?option=com_content&view=article&id=166&lang=en) and [official station names](https://www.railway.gov.lk/web/images/pdf/Ticket_Price_Line/main_line.pdf). Each of the two single-track segments holds one train at a time. Each train stops at Gampola for at least two minutes. Trains can wait outside the corridor at either endpoint. An arriving train releases the segment before another departs at the same minute. This simplified rule includes no separate clearance interval.

The fixed order on the Peradeniya Junction–Gampola segment is A, B, C. On the Gampola–Nawalapitiya segment it is B, A, C. Departures may be delayed but cannot occur early.

For a hand check, delay only A's entry by 25 minutes. A reaches Gampola at 10:25, so B departs Gampola at 10:25 and clears the Peradeniya Junction segment at 10:43. C can then depart at 10:43. Each of B and C incurs 25 minutes of additional waiting, for a total of 50 train-minutes across the other services.

## Scheduled segment durations

| Reference train | Segment | Published departure | Published arrival | Model duration |
|---|---|---|---|---|
| 1005 | Peradeniya Junction to Gampola | 09:06 | 09:27 | 21 min |
| 1005 | Gampola to Nawalapitiya | 09:33 | 09:58 | 25 min |
| 1006 | Nawalapitiya to Gampola | 14:52 | 15:19 | 27 min |
| 1006 | Gampola to Peradeniya Junction | 15:20 | 15:38 | 18 min |

Sources accessed 22 November 2026: [Ideabeam, train 1005](https://transport.ideabeam.com/train/details/1005) and [Amestri, train 1006 stopping timetable](https://amestri.com/podi-manike-a-fun-train-ride-through-the-mountains-of-sri-lanka-colombo-to-badulla/). The model applies train 1005 durations to A and C and train 1006 durations to B. Gampola dwell is handled separately. These values describe one published schedule per direction. Observed trip durations and the current through-service schedule have not been verified.
