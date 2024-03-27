#!/usr/bin/env python3

"""
Parser that uses the RTE-FRANCE API to return the following data type(s)
fetch_price method copied from FR parser.
Day-ahead Price
"""

import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from logging import Logger, getLogger

import arrow
from requests import Session

from parsers.lib.config import refetch_frequency


@refetch_frequency(timedelta(days=1))
def fetch_price(
    zone_key: str,
    session: Session | None = None,
    target_datetime: datetime | None = None,
    logger: Logger = getLogger(__name__),
) -> list:
    if target_datetime:
        now = arrow.get(target_datetime, tz="Europe/Paris")
    else:
        now = arrow.now(tz="Europe/London")

    r = session or Session()
    formatted_from = now.shift(days=-1).format("DD/MM/YYYY")
    formatted_to = now.format("DD/MM/YYYY")

    url = f"http://eco2mix.rte-france.com/curves/getDonneesMarche?dateDeb={formatted_from}&dateFin={formatted_to}&mode=NORM"

    response = r.get(url)
    obj = ET.fromstring(response.content)
    datas = {}

    for donnesMarche in obj:
        if donnesMarche.tag != "donneesMarche":
            continue

        start_date = arrow.get(
            arrow.get(donnesMarche.attrib["date"]).datetime, "Europe/Paris"
        )

        for item in donnesMarche:
            if item.get("granularite") != "Global":
                continue
            country_c = item.get("perimetre")
            if zone_key != country_c:
                continue
            value = None
            for value in item:
                if value.text == "ND":
                    continue
                period = int(value.attrib["periode"])
                datetime = start_date.shift(hours=+period).datetime
                if datetime not in datas:
                    datas[datetime] = {
                        "zoneKey": zone_key,
                        "currency": "EUR",
                        "datetime": datetime,
                        "source": "rte-france.com",
                    }
                data = datas[datetime]
                data["price"] = float(value.text)

    return list(datas.values())
