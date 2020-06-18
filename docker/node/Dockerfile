FROM node:12.16.1-stretch@sha256:facc1cbde6e5aa3255092b1a1417451953c80bd31ab5a4403f8bcd90b90a8407

ENV PATH="/opt/visual-regression-tester/bin:${PATH}"

RUN apt-get update && \
    apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libnotify-dev \
    libgtk2.0-0 xvfb && \
    rm -rf /var/lib/apt/lists/*

COPY ./entrypoint.sh "/opt/visual-regression-tester/entrypoint.sh"
COPY ./bin "/opt/visual-regression-tester/bin"

ENTRYPOINT [ "/opt/visual-regression-tester/entrypoint.sh" ]