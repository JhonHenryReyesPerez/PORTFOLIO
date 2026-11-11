package io.github.jhonhenryreyesperez.portfolio.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class FixedWindowRateLimiterTest {

	private final MutableClock clock = new MutableClock(Instant.parse("2026-01-01T00:00:00Z"));
	private final FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(2, Duration.ofMinutes(10), clock);

	@Test
	void allowsRequestsUpToTheLimit() {
		assertThat(limiter.tryAcquire("a")).isZero();
		assertThat(limiter.tryAcquire("a")).isZero();
	}

	@Test
	void rejectsOverTheLimitAndReportsTheWait() {
		limiter.tryAcquire("a");
		limiter.tryAcquire("a");
		clock.advance(Duration.ofMinutes(4));

		assertThat(limiter.tryAcquire("a")).isEqualTo(Duration.ofMinutes(6));
	}

	@Test
	void countsEachKeySeparately() {
		limiter.tryAcquire("a");
		limiter.tryAcquire("a");

		assertThat(limiter.tryAcquire("b")).isZero();
	}

	@Test
	void startsANewWindowAfterItExpires() {
		limiter.tryAcquire("a");
		limiter.tryAcquire("a");
		limiter.tryAcquire("a");
		clock.advance(Duration.ofMinutes(10));

		assertThat(limiter.tryAcquire("a")).isZero();
	}

	/** Reloj que se adelanta a mano en las pruebas. */
	static final class MutableClock extends Clock {

		private Instant now;

		MutableClock(Instant start) {
			this.now = start;
		}

		void advance(Duration duration) {
			now = now.plus(duration);
		}

		@Override
		public Instant instant() {
			return now;
		}

		@Override
		public ZoneOffset getZone() {
			return ZoneOffset.UTC;
		}

		@Override
		public Clock withZone(java.time.ZoneId zone) {
			return this;
		}
	}
}
