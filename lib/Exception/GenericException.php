<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2021, Watcha <contact@watcha.fr>
 *
 * @author Charlie Calendre <c-cal@watcha.fr>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Watcha\Exception;

use OCP\AppFramework\Http;

class GenericException extends \Exception {
    public function __construct($message = "", $HTTPCode = Http::STATUS_INTERNAL_SERVER_ERROR) {
        parent::__construct($message);
        $this->$HTTPCode = $HTTPCode;
    }

    /**
     * Returns the HTTP statuscode for this exception.
     *
     * @return int
     */
    public function getHTTPCode() {
        return $this->HTTPCode;
    }
}
