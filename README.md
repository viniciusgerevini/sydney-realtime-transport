# Services Communication Playground

Playing with a distributed solution.

Goals:
- Creating service communication based on messages
- Experimenting with different languages for each part of the solution
- Being able to make E2E testing with stubbed data providers

## Overview

TODO

## Assumptions and Decisions:

- Cities are identified by [ISO Alpha2 Country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) + `_` + `uppercase city name`. e.g. `AU_SYDNEY`
- Each service could be in its own repository, however I decided to keep them in the same repo for the sake of simplicity
